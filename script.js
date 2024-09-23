const puppeteer = require('puppeteer');
const mysql = require('mysql2');
require('dotenv').config()

function corrigirNumeros(numero) {
    if (numero !== undefined) {
        let numeroTratado = parseFloat(numero.toString().replaceAll(')', '').replaceAll('.', '').replaceAll(',', '.'));
        if (!isNaN(numeroTratado) && numero.toString().includes('(')) {
            return numeroTratado * -1;
        }
        if (isNaN(numeroTratado)) {
            return 0;
        }
        return numeroTratado;
    }
    return 0;
}
async function extractVariable(page) {
    const initialVariable = "Resumo do Cálculo";
    const endVariable = "Percentual";

    let extrairPrimeiraTabela = false;

    const dadosTabela1 = [];
    const searchTR = await page.$$("tr");

    for (const extractTR of searchTR) {
        const textoLinha = await page.evaluate(el => el.textContent.trim(), extractTR);

        if (textoLinha.includes(initialVariable)) {
            extrairPrimeiraTabela = true;
            continue;
        }
        if (extrairPrimeiraTabela && textoLinha.includes(endVariable)) {
            break;
        }
        if (extrairPrimeiraTabela) {
            const searchTD = await extractTR.$$('td');
            const linhaArray = [];

            for (const extractTD of searchTD) {
                const texto = await page.evaluate(el => el.textContent.trim(), extractTD);
                if (texto !== "") {
                    linhaArray.push(texto);
                }
            }
            if (linhaArray.length > 0) {
                dadosTabela1.push(linhaArray);
            }
        }
    }
    return { dadosTabela1 };
}

const reclamanteId = 1;

async function processDatabase() {
    try {
        const browser = await puppeteer.launch({ headless: false, executablePath: "" });
        const page = await browser.newPage();

        await page.goto("file:///C:/Users/Administrador/Desktop/RELATORIO/RELATORIO_PROCESSO_00210628420205040026_CALCULO_3_DATA_11092024_HORA_170424.html");
        await page.waitForSelector("tr");

        const { dadosTabela1 } = await extractVariable(page);

        // Processamento da primeira tabela
        const dadosModificados = dadosTabela1.map((array, index) => {
            if (index >= 6 && index < dadosTabela1.length - 2) {
                return {
                    descricao: (array[0]),
                    valor: corrigirNumeros(array[1]),

                    juros: corrigirNumeros(array[2]),
                    total: corrigirNumeros(array[3]),

                };

            } else if (index >= dadosTabela1.length - 2) {
                return {
                    valor: corrigirNumeros(array[0]),
                    juros: corrigirNumeros(array[1]),
                    total: corrigirNumeros(array[2]),
                };
            }
            return array;
        });
        console.log("Dados Tabela 1:", dadosModificados);
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });
        connection.connect();
        const inserirDadosTabela1 = "INSERT INTO resumo_calculo (descricao, valor, juros, total, reclamanteId) VALUES (?, ?, ?, ?, ?)";
        for (const item of dadosModificados) {
            if (item.descricao) {
                connection.query(inserirDadosTabela1, [item.descricao, item.valor, item.juros, item.total, reclamanteId], (error, results) => {
                    if (error) throw error;
                });
            } else {
                connection.query(inserirDadosTabela1, [item.descricao || "", item.valor || 0, item.juros || 0, item.total || 0, reclamanteId || undefined], (error, results) => {
                    if (error) throw error;
                });
            }
        }
        connection.end();
        await browser.close();
    } catch (erro) {
        console.log(erro);
    }
}
processDatabase();
