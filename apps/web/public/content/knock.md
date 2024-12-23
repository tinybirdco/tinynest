# Connect Knock to Tinybird

1. In Knock, go to your repository **Developers** > **Webhooks**.
   
2. Select **Create webhook**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Knock, paste the Events API URL in your Webhook URL. Use the query parameter `name=knock` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=knock&token=TOKEN
```

5. Select the events you want to send to Tinybird then **Save webhook**.

6.  You're done. Knock events are automatically sent to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
