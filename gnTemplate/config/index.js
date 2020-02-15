module.exports = {
    dir: 'User',
    files: [['index.js', 'jsx'], 'schema'],
    regs: {
        ClassName: 'User'
    },
    lineRegs: [
        ['#!', item => `${item[0]}: '', // ${item[1]}`],
        ['#!!', item => `{title: '${item[1]}', dataIndex: '${item[0]}'}, `]
    ],
    database: {
        use: true,
        connect: {
            host: '119.3.237.250',
            user: 'root',
            password: 'root',
            database: 'test'
        },
        table: 'user_test'
    }
}
