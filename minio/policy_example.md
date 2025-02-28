### Create access key with Full permission to bucket **stg-demo** 
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::stg-demo",
        "arn:aws:s3:::stg-demo/*"
      ]
    }
  ]
}
```

### Make bucket public have and read access only
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::stg-demo/*"
      ]
    }
  ]
}
```