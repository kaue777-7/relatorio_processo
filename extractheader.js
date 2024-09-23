const puppeteer = require('puppeteer');
const mysql = require('mysql2');
require('dotenv').config();


function searchPattern(text, input) {
    return text.indexOf(input);
}

function extractBetween(text, startWord, endWord) {
    const startWordLength = startWord.length;
    let extractedText = text.substr(searchPattern(text, startWord) + startWordLength, searchPattern(text, endWord) - searchPattern(text, startWord) - startWordLength);
    return extractedText.trim();
}



async function extrairHeader(page) {

    let reportText = '';
    //const TRs = await page.$$("table");

    reportText = await page.evaluate(() => {
        return document.querySelector('table').textContent.replaceAll(/\n/g, '').replaceAll(/\s+/g, ' ');
    });

    //console.log(reportText);
    const processo = extractBetween(reportText, "Processo:", "Cálculo:");
    const calculo = extractBetween(reportText, "Cálculo:", "PLANILHA");
    const reclamante = extractBetween(reportText, "Reclamante:", "Reclamado:");
    const reclamado = extractBetween(reportText, "Reclamado:", "Período do Cálculo:");
    const periodo_calculo = extractBetween(reportText, "Período do Cálculo:", "Data Ajuizamento");
    const data_ajuizamento = extractBetween(reportText, "Data Ajuizamento:", "Data Liquidação");
    const data_liquidacao = extractBetween(reportText, "Data Liquidacao:", "Resumo do cálculo");
    return {
        processo,
        calculo,
        reclamante,
        reclamado,
        periodo_calculo,
        data_ajuizamento,
        data_liquidacao
    };
}
async function processHeader() {
    try {
        const browser = await puppeteer.launch({ headless: false, executablePath: "" });
        const page = await browser.newPage();

        await page.goto("file:///C:/Users/Administrador/Desktop/RELATORIO/RELATORIO_PROCESSO_00210628420205040026_CALCULO_3_DATA_11092024_HORA_170424.html");
        await page.waitForSelector("tr");

        const dadosHeader = await extrairHeader(page);

        function formatDate(dateString) {
            const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
                const [_, day, month, year] = match;
                return `${year}-${month}-${day}`;
            }
            return null;
        }
        const headersArray = [dadosHeader];
        const formatted = headersArray.map(dadosHeader => ({
            Processo: dadosHeader.processo || "",
            Calculo: dadosHeader.calculo || "",
            Reclamante: dadosHeader.reclamante || "",
            Reclamado: dadosHeader.reclamado || "",
            Periodo_Calculo: formatDate(dadosHeader.periodo_calculo) || null,
            Data_Ajuizamento: formatDate(dadosHeader.data_ajuizamento) || null,
            Data_Liquidacao: formatDate(dadosHeader.data_liquidacao) || null,
        }));
        console.log("Dados Resumo", formatted);
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });

        connection.connect();
        for (const header of formatted) {
            try {
                const InsertHeader = "INSERT INTO extractheader (Processo, Calculo, Reclamante, Reclamado, Periodo_Calculo, Data_Ajuizamento, Data_Liquidacao) VALUES (?, ?, ?, ?, ?, ?, ?)";
                connection.execute(InsertHeader, [
                    header.Processo,
                    header.Calculo,
                    header.Reclamante,
                    header.Reclamado,
                    header.Periodo_Calculo,
                    header.Data_Ajuizamento,
                    header.Data_Liquidacao
                ], (err, results) => {
                    if (err) {
                        console.log("Erro ao inserir dados", err);
                    } else {
                        const reclamanteId = results.insertId;
                        console.log("Reclamante ID:", reclamanteId);
                    }
                });
                console.log('Dados inseridos com sucesso!');
            } catch (err) { console.error('Erro ao inserir dados:', err); }
        }
        connection.end();

        await browser.close();
    } catch (erro) {
        console.log(erro);
    }
}
processHeader()