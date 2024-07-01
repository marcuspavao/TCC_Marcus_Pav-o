from math import trunc
import asyncio
import time
from pymodbus.client import AsyncModbusTcpClient
import wmi
from datetime import datetime

w = wmi.WMI(namespace="root\OpenHardwareMonitor")

def getTemperature():
    temperature_infos = w.Sensor()
    for sensor in temperature_infos:
        if sensor.ProcessId == '6ebd23d0-be5a-4fb8-9090-675bfa53de57' and sensor.Parent == '/amdcpu/0' and sensor.InstanceId == '3914':
            return trunc(sensor.Value * 100)

async def write_data_to_server():
    ESP32_IP_Address = '192.168.3.16'

    client = AsyncModbusTcpClient(ESP32_IP_Address)
    await client.connect()

    print("Client:", client)

    assert client.connected

    temperature = getTemperature()

    while True:
        try:
            temperature = getTemperature()
            print(f"Temperature: {temperature}, Current time: {datetime.now().strftime('%H:%M:%S')}")
            await client.write_register(101, temperature)

            await asyncio.sleep(18)  # Aguarda 18 segundos antes de atualizar novamente
        except Exception as e:
            print(f"Erro ao comunicar com o servidor Modbus: {e}")
            await asyncio.sleep(10)  # Tenta novamente após 10 segundos em caso de erro

asyncio.run(write_data_to_server())
