#!/usr/bin/env python3

import os
import sys
import requests
import datetime
from typing import Dict, Any, Optional

# Configuration
BOT_TOKEN = "BOT_TOKEN"  # Replace with your Telegram bot token
CHAT_ID = "CHAT_ID"  # Your Telegram group ID
PROXY_URL = "http://10.1.1.1:8800"  # Your proxy server

def send_telegram_message(message: str) -> None:
    """Send a message to Telegram using a proxy"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"  # Changed to Markdown for code block formatting
    }
    
    proxies = {
        "http": PROXY_URL,
        "https": PROXY_URL
    }
    
    try:
        response = requests.post(url, json=payload, proxies=proxies)
        response.raise_for_status()
        sys.stdout.write(f"Successfully sent message to Telegram. Response: {response.status_code}\n")
    except requests.exceptions.RequestException as e:
        sys.stderr.write(f"Error sending Telegram notification: {e}\n")
        sys.exit(1)

def format_notification() -> str:
    """Format the notification message from Check_MK environment variables"""
    if os.environ.get('NOTIFY_WHAT') == "HOST":
        return format_host_notification()
    else:
        return format_service_notification()

def format_host_notification() -> str:
    """Format a host notification"""
    host = os.environ.get('NOTIFY_HOSTNAME', '(unknown)')
    alias = os.environ.get('NOTIFY_HOSTALIAS', host)
    address = os.environ.get('NOTIFY_HOSTADDRESS', '(unknown)')
    state = os.environ.get('NOTIFY_HOSTSTATE', '(unknown)')
    last_state = os.environ.get('NOTIFY_LASTHOSTSTATE', '(unknown)')
    output = os.environ.get('NOTIFY_HOSTOUTPUT', '(no output)')
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    message = "```\n"
    message += f"Host:     {host}\n"
    message += f"Alias:    {alias}\n"
    message += f"Address:  {address}\n"
    message += f"Event:    {last_state} -> {state}\n"
    message += f"Output:   {output}\n"
    message += f"Time:     {time}\n"
    message += "```"
    
    return message

def format_service_notification() -> str:
    """Format a service notification"""
    host = os.environ.get('NOTIFY_HOSTNAME', '(unknown)')
    alias = os.environ.get('NOTIFY_HOSTALIAS', host)
    address = os.environ.get('NOTIFY_HOSTADDRESS', '(unknown)')
    service = os.environ.get('NOTIFY_SERVICEDESC', '(unknown)')
    state = os.environ.get('NOTIFY_SERVICESTATE', '(unknown)')
    last_state = os.environ.get('NOTIFY_LASTSERVICESTATE', '(unknown)')
    output = os.environ.get('NOTIFY_SERVICEOUTPUT', '(no output)')
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    message = "```\n"
    message += f"Host:     {host}\n"
    message += f"Alias:    {alias}\n"
    message += f"Address:  {address}\n"
    message += f"Service:  {service}\n"
    message += f"Event:    {last_state} -> {state}\n"
    message += f"Output:   {output}\n"
    message += f"Time:     {time}\n"
    message += "```"
    
    return message

def main() -> None:
    # For testing, you can use a hardcoded message
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_message = "```\nHost:     test_host\nAlias:    test_host\nAddress:  127.0.0.1\nService:  HTTPS Test\nEvent:    OK -> CRIT\nOutput:   Could not connect to https://test.com/ within specified timeout: 10 seconds (!!)\nTime:     " + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "\n```"
        send_telegram_message(test_message)
        sys.exit(0)
    
    message = format_notification()
    send_telegram_message(message)
    sys.exit(0)

if __name__ == "__main__":
    main()