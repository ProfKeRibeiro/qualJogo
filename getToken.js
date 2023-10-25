//Importa classes de construção, localização, tecla e até do selenium-webdriver
const { Builder, By, Key, until } = require('selenium-webdriver');
//define as configurações do chrome
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();
options.addArguments('--disable-extensions');
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('window-size=1920,1080');
// options.addArguments('--headless');
options.addArguments('--disable-dev-shm-usage');
//função para logar no spotify e extrair o token da documentação de desenvolvedor
async function getToken() {
  //contrutor do selenium-webdriver para o chrome com as configurações definidas acima
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    //funções assincronas para logar no spotify
    await driver.get('https://accounts.spotify.com/');
    await driver.sleep(2000);
    await driver.findElement(By.id('login-username')).sendKeys('seuemail@mail.com');
    await driver.findElement(By.id('login-password')).sendKeys('suaSenha');
    await driver.sleep(2000);
    await driver.findElement(By.id('login-button')).click();
    await driver.sleep(5000);
    //loop para extrair o token
    while (true) {
        try {
          //funções assincronas para localizar o iframe do botão e clicar nele
            await driver.get('https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started');
            await driver.sleep(3000);
            const iframe = await driver.findElement(By.css("iframe[src='/token-button']"));
            await driver.executeScript("arguments[0].scrollIntoView();", iframe);
            await driver.switchTo().frame(iframe);
            const button = await driver.wait(until.elementLocated(By.css("button[data-encore-id='buttonPrimary']")), 10000);
            await button.click();
            //funções assincronas para extrair o token e salvar em um arquivo json
            const token = await driver.wait(until.elementLocated(By.css("span[data-encore-id='type']")), 10000).getText();
            const fs = require('fs');
            fs.writeFileSync('token.json', JSON.stringify({ token }));
            //funções assincronas para voltar para o site do spotify e sair do iframe
            await driver.switchTo().defaultContent();
        } catch (e) {
          //caso ocorra algum erro, ele será exibido no console
            console.log(`Ocorreu um erro: ${e}`);
        }
        //loop para atualizar a página a cada 50 minutos
        for (let i = 3000; i > 0; i--) {
            const time_remaining = `${Math.floor(i / 60)} minutos e ${i % 60} segundos restantes para atualizar a página`;
            console.log(time_remaining);
            await driver.sleep(1000);
        }
    }
}

getToken();
