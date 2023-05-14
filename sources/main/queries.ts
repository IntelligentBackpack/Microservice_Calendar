import sql, { config } from 'mssql';

const conf: config = {
    user: 'intelligentSystem', // better stored in an app setting such as process.env.DB_USER
    password: 'LSS#2022', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'intelligent-system.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'IntelligentBackpack', // better stored in an app setting such as process.env.DB_NAME
    options: {
        encrypt: true
    }
}

export async function EXAMPLE(email: String){
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Utente where Email = '" + email + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        if(resultSet.rowsAffected[0] == 0)
            return 0;

        var data: any;
        resultSet.recordset.forEach(function(row: any) {
            data = row;
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
}