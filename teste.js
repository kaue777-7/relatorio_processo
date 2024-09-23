// const puppeteer = require('puppeteer');
// const mysql = require('mysql2');
// require('dotenv').config();


// function searchPattern(text, input){
//     return text.indexOf(input);
// }

// function extractBetween(text, startWord, endWord) {
//     const startWordLength = startWord.length;
//     let extractedText = text.substr(searchPattern(text, startWord) + startWordLength, searchPattern(text, endWord) - searchPattern(text, startWord) - startWordLength);
//     return extractedText.trim();
// }


// async function extrairHeader(page) {
  
//     let reportText = '';
//     //const TRs = await page.$$("table");

//     reportText = await page.evaluate(() => {
//         return document.querySelector('table').textContent.replaceAll(/\n/g, '').replaceAll(/\s+/g, ' ');
//     });

//     //console.log(reportText);
//     const processo = extractBetween(reportText, "Processo:", "Cálculo:");
//     const calculo = extractBetween(reportText, "Cálculo:", "PLANILHA");
//     const reclamante = extractBetween(reportText, "Reclamante:", "Reclamado:");
//     const reclamado = extractBetween(reportText, "Reclamado:", "Período do Cálculo:");
//     const periodo_calculo = extractBetween(reportText, "Período do Cálculo:", "Data Ajuizamento");
//     const data_ajuizamento = extractBetween(reportText, "Data Ajuizamento:", "Data Liquidação");
//     const data_liquidacao = extractBetween(reportText, "Data Liquidação:", "Resumo do cálculo");
//     return {
//         processo,
//         calculo,
//         reclamante,
//         reclamado,
//         periodo_calculo,
//         data_ajuizamento,
//         data_liquidacao
//     };
// }
// async function processHeader() {
//     try {
//         const browser = await puppeteer.launch({ headless: false, executablePath: "" });
//         const page = await browser.newPage();

//         await page.goto("file:///C:/Users/Administrador/Desktop/RELATORIO/RELATORIO_PROCESSO_00210628420205040026_CALCULO_3_DATA_11092024_HORA_170424.html");
//         await page.waitForSelector("tr");
      
//         const dadosHeader = await extrairHeader(page);
    
//         function formatDate(dateString){
//             const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
//             if (match) {
//                 const [_, day, month, year] = match;
//                 return `${year}-${month}-${day}`;
//             }
//             return null;
//         }

//         const HeaderIndex = {
//             Processo: dadosHeader.processo || undefined,
//             Calculo: dadosHeader.calculo || undefined,
//             Reclamante: dadosHeader.reclamante || undefined,
//             Reclamado: dadosHeader.reclamado || undefined,
//             Periodo_Calculo: dadosHeader.periodo_calculo || undefined,
//             Data_Ajuizamento: formatDate(dadosHeader.data_ajuizamento) || undefined,
//             Data_Liquidacao: formatDate(dadosHeader.data_liquidacao) || undefined,
//         };
//         console.log("Dados Resumo", HeaderIndex);
//         const connection = mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//             database: process.env.DB_NAME,
//             port: process.env.DB_PORT,
//         });

//         connection.connect();
//         const InsertHeader = "INSERT INTO cabecalho_calculo (Calculo, Reclamante, Reclamado, Data_Ajuizamento, Processo, Data_Liquidação) VALUES (?, ?, ?, ?, ?, ?)";
//         connection.query(InsertHeader, [
//             HeaderIndex.Calculo,
//             HeaderIndex.Reclamante,
//             HeaderIndex.Reclamado,
//             HeaderIndex.Data_Ajuizamento,
//             HeaderIndex.Periodo_Calculo,
//             HeaderIndex.Processo,
//             HeaderIndex.Data_Liquidacao
//         ], (error) => {
//             if (error) throw error;
//         });
//         connection.end();
//         await browser.close();
//     } catch(erro) {
//         console.log(erro);
//     }
// }
// processHeader()