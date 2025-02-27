### Instruction
- Create folder
```
mkdir cmk_data
```
- User default: `cmkadmin`

- Need proxy? Add lines below to environment section:
```
      - HTTP_PROXY=http://10.0.0.1:8800
      - HTTPS_PROXY=http://10.0.0.1:8800
      - NO_PROXY=localhost,127.0.0.1
```