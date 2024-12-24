# Connect GitLab to Tinybird

1. In GitLab, go to **Settings** > **Webhooks**.
   
2. Select **Add new webhook**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in GitLab, paste the Events API URL in your Webhook URL. Use the query parameter `name=gitlab`. For example:

```
https://api.tinybird.co/v0/events?name=gitlab
```

5. Select **Add custom header** and add 'Authorization' as **Header name** and paste the token you created in Tinybird as **Header value**.

```
Bearer <TOKEN>
```

6. You're done. You can select **Test** to check if the webhook is working.

Check the status of the integration from the **Log** tab in the Tinybird `gitlab` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [GitLab Webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html)
* [Tinybird Data Sources](https://github.com/tinybirdco/tinynest/blob/main/tinybird/datasources/)
