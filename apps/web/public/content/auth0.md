# Connect Auth0 to Tinybird

1. From the Auth0 dashboard, select **Monitoring** > **Streams**.
   
2. Select **Create Stream**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Auth0, paste the Events API URL in your Webhook Endpoint URL. Use the query parameter `name=auth0` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=auth0&token=TOKEN
```

Content Type is `application/json` and Content Format is `JSON Lines`.

5. Select the any event category to filter, like `All`, and a date in case you want to perform some backfilling. Then select **Save**.

2. You're done. Any of the Auth0 Log Streams events you selected is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

You can check the status of the integration from the **Health** tab in the created webhook or from the **Log** tab in the Tinybird `auth0` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Auth0 Logs Streams](https://auth0.com/docs/customize/log-streams/custom-log-streams)
