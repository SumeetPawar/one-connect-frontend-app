import asyncio
import asyncpg
import uuid
from datetime import datetime

async def create_gesbms_department():
    print(' Connecting to LOCAL database...')
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='fitness',
        password='fitnesspass',
        database='fitnessdb'
    )
    
    print(' Connected!')
    
    # Check if GESBMS already exists
    existing = await conn.fetchrow(\"\"\"
        SELECT * FROM departments WHERE name = 'GESBMS'
    \"\"\")
    
    if existing:
        print(f\"\\n GESBMS already exists with ID: {existing['id']}\")
        await conn.close()
        return existing['id']
    
    # Create GESBMS department
    dept_id = uuid.uuid4()
    
    try:
        await conn.execute(\"\"\"
            INSERT INTO departments (id, name, description, created_at)
            VALUES (\, \, \, \)
        \"\"\",
            dept_id,
            'GESBMS',
            'GES Building Management System - Default Department',
            datetime.now()
        )
        
        print(f'\\n GESBMS department created!')
        print(f'   ID: {dept_id}')
        print(f'   Name: GESBMS')
        print(f'   Description: GES Building Management System')
        
        return dept_id
        
    except Exception as e:
        print(f'\\n Error: {e}')
        return None
    finally:
        await conn.close()

if __name__ == '__main__':
    dept_id = asyncio.run(create_gesbms_department())
    if dept_id:
        print(f'\\n Add this to your backend .env:')
        print(f'DEFAULT_DEPARTMENT_ID={dept_id}')
