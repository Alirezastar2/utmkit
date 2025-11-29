import pandas as pd
from clickhouse_driver import Client

# اتصال به ClickHouse
client = Client(
    host="172.21.16.1", port="9000",
    user='alireza_mohammadi',
    password='evfanqrL4MmrDqdnGfEX',
    database='dwh'   # بهتره دیتابیس رو مشخص کنی
)

# کوئری SQL
import pandas as pd
from clickhouse_driver import Client

# اتصال به ClickHouse
client = Client(
    host="172.21.16.1", port="9000",
    user='alireza_mohammadi',
    password='evfanqrL4MmrDqdnGfEX',
    database='dwh'   # بهتره دیتابیس رو مشخص کنی
)

# کوئری SQL
query = """
SELECT 
    promoter_code,
    name,
    cellphone,
    city_id,
    birth_date,
    membership_date
FROM dwh.snapp_promoters_info_view
WHERE 
    birth_date IS NOT NULL        -- مقدار NULL نباشه
    AND birth_date != ''          -- خالی نباشه
    AND birth_date != '0000-00-00' -- اگر همچین دیتایی داری
LIMIT 10;

"""

cols = client.execute(query)
df = pd.DataFrame(cols, columns=['column_name'])
print(df)

