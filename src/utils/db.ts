import mysql, { RowDataPacket } from 'mysql2/promise'

const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '123456',
    database        : 'boke',
    port            : 3306
})



/**
 * 封装通用查询语句
 * @param sql SQL 语句（带 ? 占位符）
 * @param params SQL 参数数组（可选）
 * @returns 查询结果 rows
 */
export async function execQuery<T extends RowDataPacket = RowDataPacket>(sql: string, params: any[] = []) {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query<T[]>(sql, params)
    return rows
  } catch (err) {
    console.error('Query Error:', err)
    throw err // 抛出错误给调用方处理
  } finally {
    connection.release()
  }
}

/**
 * 执行事务操作
 * @param handler - 事务处理函数，接收一个事务执行器对象
 * @returns 事务处理结果
 */
export async function withTransaction<T>(task: (conn: mysql.PoolConnection)=>Promise<T>){
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        const result = await task(connection)
        connection.commit()
        return result
    } catch (error) {
        connection.rollback()
        throw error
    }finally{
        connection.release()
    }
}
