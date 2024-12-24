# Connect Resend to Tinybird

1. Open the Resend UI and go to the Webhooks page.
   
2. Select "Add Webhook".

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Resend, paste the Events API URL in your Webhook URL. Use the query parameter `name=orb` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=orb&token=TOKEN
```

5. Select the checkboxes for the Resend events you want to send to Tinybird, and select "Add".

6. You're done. Sending emails to Resend will now push events to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
