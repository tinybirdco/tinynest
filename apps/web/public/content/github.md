# Connect GitHub to Tinybird

1. In GitHub, go to your repository **Settings** > **Webhooks**.
   
2. Select **Add webhook**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in GitHub, paste the Events API URL in your Webhook URL. Use the query parameter `name=github` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=github&token=TOKEN
```

5. Select the events you want to send to Tinybird.

6. Select application/json as the content type.

7.  You're done. GitHub events are automatically sent to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
