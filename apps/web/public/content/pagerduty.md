# Connect PagerDuty to Tinybird

1. From the PagerDuty dashboard, select **Integrations** > **Developer Tools** > **Webhooks**
   
2. Select "New Webhook".

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in PagerDuty, paste the Events API URL in your Webhook URL. Use the query parameter `name=pagerduty`. For example:

```
https://api.tinybird.co/v0/events?name=pagerduty&token=TOKEN
```

5. Select **Add custom header** and add 'Authorization' as **Name** and paste the token as **Value**.

6. Select all event subcriptions and **Add webhook**

7. You're done. PagerDuty events are automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
