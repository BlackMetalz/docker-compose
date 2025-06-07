### Introduction
```
MailCatcher runs a super simple SMTP server which catches any message sent to it to display in a web interface. Run mailcatcher, set your favourite app to deliver to smtp://127.0.0.1:1025 instead of your default SMTP server, then check out http://127.0.0.1:1080 to see the mail that's arrived so far.
```

- Link: https://mailcatcher.me/


### Usage
- Test command
```
curl -s --url 'smtp://127.0.0.1:1025' \
  --mail-from 'sender@example.com' \
  --mail-rcpt 'recipient@example.com' \
  -T <(echo -e "Subject: Test Email\n\nHello from Docker!")
```