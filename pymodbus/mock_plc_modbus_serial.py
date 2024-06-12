import asyncio
import random
from pymodbus.client import AsyncModbusTcpClient

#Comparação entre MODBUS TCP e MODBUS SERIAL

async def write_data_to_serial():
    # IP address of the ESP32 Modbus server
    ESP32_IP_Address = '192.168.3.9'

    # Create a Modbus TCP client\
    client =  AsyncModbusTcpClient(
        ESP32_IP_Address
    )
    
    await client.connect()

    print("Client:", client)

    assert client.connected

    for i in range(5):

        await client.write_register(101, random.randint(0, 1000))

# Run the asynchronous function
asyncio.run(write_data_to_server())