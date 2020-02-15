const config = require('./config')
const fs = require('fs')
const path = require('path')
var mysql = require('mysql');
const R = require('ramda');

function getDatabaseSchema(database, table, callback = () => { }) {
    if (R.type(table) === "Function") {
        callback = table
        table = ''
    }
    // 创建连接
    var connection = mysql.createConnection(database.connect);
    connection.connect();
    // sql: show full columns from tableName
    connection.query(`SHOW FULL COLUMNS FROM ${table || database.table}`, function (error, results) {
        if (error) throw error;
        console.log(results)
        // Field: 为字段名， Comment为注释
        callback(R.map((item) => {
            return [item.Field, item.Comment]
        })(results))
    });
    connection.end();
}

function createMultipleLine(reg, r, data, text) {
    return text.replace(reg, (line, t1) => {
        return data.map(item => {
            return line.replace(t1, r(item))
        }).join('')
    })
}

function createTpl() {
    // 代码存放的目录
    const dirPath = path.resolve(__dirname, config.dir)
    // 模板存放的目录
    const templatePath = path.resolve(__dirname, './template')
    // 文件列表
    const files = config.files
    // 判断代码存放的目录是否存在
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
    }
    // 模板是否存在
    if (fs.existsSync(templatePath)) {
        // 模板文件遍历
        files.map((file) => {
            let suffix = 'js'
            let fileName = file
            if (R.type(file) === 'Array') {
                [file, suffix] = file
            }
            fileName = file.split('.')[0]
            // 模板文件路径
            let tplFilePath = path.resolve(templatePath, file)
            // 如果模板文件存在
            if (fs.existsSync(tplFilePath)) {
                // 读模板文件
                fs.readFile(tplFilePath, (err, data) => {
                    if (err) throw err;
                    let text = data.toString() // buffer to string
                    let keys = Object.keys(config.regs)
                    keys.forEach(key => {
                        // 替换字段 {$字段名$}
                        text = text.replace(new RegExp(`{\\s*\\$${key}\\$\\s*}`, 'g'), config.regs[key])
                    })
                    // 如果启用数据库，读表结构
                    if (config.database.use) {
                        getDatabaseSchema(config.database, (data = []) => {
                            let curryCreateMultipleLine = R.curry(createMultipleLine)
                            let pipes = config.lineRegs.map(item => {
                                let [reg, f] = item
                                return curryCreateMultipleLine(new RegExp(`[^\\r\\n]*(${reg})\\r\\n`, 'g'))(f)(data)
                            })
                            text = R.reduce((acc, f) => f(acc), text, pipes)
                            fs.writeFileSync(path.resolve(dirPath, `./${fileName}.${suffix}`), text)
                        })
                    } else {
                        // 写文件
                        fs.writeFileSync(path.resolve(dirPath, `./${fileName}.${suffix}`), text)
                    }
                });
            }
        })
    }
}

createTpl()
