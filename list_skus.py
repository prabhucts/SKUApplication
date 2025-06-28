import sqlite3

# Connect to the database
conn = sqlite3.connect('backend/sku_database.db')
cursor = conn.cursor()

# Query all SKUs
cursor.execute("SELECT * FROM drug_skus")
rows = cursor.fetchall()

# Get column names
column_names = [description[0] for description in cursor.description]
print("Column names:", column_names)
print("\nAll SKUs in database:")

# Print all records
for row in rows:
    print("-------------------")
    for i, value in enumerate(row):
        print(f"{column_names[i]}: {value}")

# Close connection
conn.close()
