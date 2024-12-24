# Connect Mailgun to Tinybird

1. In Mailgun, go to **Send** > **Sending** > **Webhooks**.

2. Select **Domain** and **Add webhook**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Mailgun, paste the Events API URL in your Webhook URL. Use the query parameters `name=mailgun`, `token=<your token>` and `format=json`. For example:

```
https://api.tinybird.co/v0/events?name=mailgun&token=TOKEN&format=json
```

5. Select Event type and choose the event you want to send to Tinybird. You can use the same Tinybird Data Source for multiple events.

6. Select Create webhook.

7. You're done. Any of the Orb events is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

Check the status of the integration from the Log tab in the Tinybird `mailgun` Data Source.
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Orb webhooks](https://docs.withorb.com/guides/integrations-and-exports/webhooks)
