#!/usr/bin/env python3

import os
import sys
import requests
import json
from typing import Dict, Any, Optional

# Configuration
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # Replace with your Telegram bot token
CHAT_ID = "-123123"  # Your Telegram group ID

def send_telegram_message(message: str) -> None:
    """Send a message to Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
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
    state = os.environ.get('NOTIFY_HOSTSTATE', '(unknown)')
    output = os.environ.get('NOTIFY_HOSTOUTPUT', '(no output)')
    
    message = f"<b>Host Alert: {host} is {state}</b>\n"
    message += f"<pre>{output}</pre>\n"
    
    if os.environ.get('NOTIFY_NOTIFICATIONAUTHOR'):
        message += f"\nAuthor: {os.environ.get('NOTIFY_NOTIFICATIONAUTHOR')}"
    
    if os.environ.get('NOTIFY_NOTIFICATIONCOMMENT'):
        message += f"\nComment: {os.environ.get('NOTIFY_NOTIFICATIONCOMMENT')}"
    
    return message

def format_service_notification() -> str:
    """Format a service notification"""
    host = os.environ.get('NOTIFY_HOSTNAME', '(unknown)')
    service = os.environ.get('NOTIFY_SERVICEDESC', '(unknown)')
    state = os.environ.get('NOTIFY_SERVICESTATE', '(unknown)')
    output = os.environ.get('NOTIFY_SERVICEOUTPUT', '(no output)')
    
    message = f"<b>Service Alert: {host} - {service} is {state}</b>\n"
    message += f"<pre>{output}</pre>\n"
    
    if os.environ.get('NOTIFY_NOTIFICATIONAUTHOR'):
        message += f"\nAuthor: {os.environ.get('NOTIFY_NOTIFICATIONAUTHOR')}"
    
    if os.environ.get('NOTIFY_NOTIFICATIONCOMMENT'):
        message += f"\nComment: {os.environ.get('NOTIFY_NOTIFICATIONCOMMENT')}"
    
    return message

def main() -> None:
    message = format_notification()
    send_telegram_message(message)
    sys.exit(0)

if __name__ == "__main__":
    main()