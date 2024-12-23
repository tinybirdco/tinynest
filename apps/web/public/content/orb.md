# Connect Orb to Tinybird

1. From the Orb dashboard, select **Developers** > **Webhooks**.
   
2. Select **Add Endpoint**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Orb, paste the Events API URL in your Webhook URL. Use the query parameter `name=orb` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=orb&token=TOKEN
```

5. Select **Send test request** to test the connection and check the data gets to the `orb` Data Source in Tinybird.

6. You're done. Any of the Orb events is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

You can check the status of the integration by clicking on the Webhook endpoint in Orb or from the **Log** tab in the Tinybird `orb` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Orb webhooks](https://docs.withorb.com/guides/integrations-and-exports/webhooks)
