# Connect Vercel to Tinybird

1. Choose your team scope on the dashboard, and go to **Settings** > **Webhooks**.
   
2. Select the Webhooks and Projects you want to send to Tinybird

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Vercel, paste the Events API URL in your Webhook URL. Use the query parameter `name=vercel` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=vercel&token=TOKEN
```

5.  You're done. Vercel events are automatically sent to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
