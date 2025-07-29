import mysql, { OkPacketParams, RowDataPacket } from 'mysql2/promise'

const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '123456',
    database        : 'fditor-db',
    port            : 3306
})

//todo: insert|upadte|delete 返回的不是指定的类型 而是 OkPacketParams，单独实现调用方法？
export type QueryResult<T> = T[] | OkPacketParams;
/**
 * 封装通用查询语句
 * @param sql SQL 语句（带 ? 占位符）
 * @param params SQL 参数数组（可选）
 * @returns 查询结果 rows
 */
export async function execQuery<T = any, R extends QueryResult<T> = T[]>(
  sql: string,
  params: any[] = []
): Promise<R> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows as R;
  } catch (err) {
    console.error('Query Error:', err);
    throw err;
  } finally {
    connection.release();
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
