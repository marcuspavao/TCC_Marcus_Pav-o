import asyncio
import random
import time
from pymodbus.client import AsyncModbusTcpClient

#Comparação entre MODBUS TCP e MODBUS SERIAL

async def write_data_to_server():
    # IP address of the ESP32 Modbus server
    ESP32_IP_Address = '192.168.3.9'

    # Create a Modbus TCP client\
    client =  AsyncModbusTcpClient(
        ESP32_IP_Address
    )
    
    await client.connect()

    print("Client:", client)

    assert client.connected

    for i in range(20):
        time.sleep(1)

        await client.write_register(101, i ) #random.randint(0, 1000))
        await client.write_register(202, i + 200) 

# Run the asynchronous function
asyncio.run(write_data_to_server())