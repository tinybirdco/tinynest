# Send GitLab events to Tinybird
[GitLab](https://gitlab.com) is a platform for building and deploying web applications. By integrating GitLab with Tinybird, you can analyze your GitLab events in real time and enrich it with other data sources.

Some common use cases for sending GitLab events to Tinybird include:

1. Analyze GitLab issues and merge requests.
2. Analyze GitLab push events.
3. Analyze and monitor GitLab pipeline.
4. Analyze custom DORA metrics.

All this allows you to build a more complete picture of your GitLab events and improve your DevOps processes.

Read on to learn how to send events from GitLab to Tinybird.

## Before you start

Before you connect GitLab to Tinybird, ensure:

* You have a GitLab account.
* You have a Tinybird Workspace.

## Connect GitLab to Tinybird

1. In GitLab, go to **Settings** > **Webhooks**.
   
2. Select **Add new webhook**.

3. Webhooks payloads vary depending on the event type. You can check here the list of [GitLab events](https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html). So it's recommended to select one event type and create a Tinybird Data Source for it.

Select **Issues Events**.

4. In Tinybird, create a Data Source, called `gitlab_work_item`. You can follow this [schema](https://github.com/tinybirdco/tinynest/blob/main/tinybird/datasources/gitlab_work_item.datasource)

Some columns use the [JSON Data Type](/sql-reference/data-types/json) to store the semi-structured data you receive from GitLab webhooks in a single column. You can later retrieve various events and their metadata as needed in your Pipes.

Some other columns are a JSON string. Use the [JSONExtract](/sql-reference/functions/json-functions) functions to extract the data you need in your Pipes.

5. In Tinybird, copy a token with privileges to append to the Data Source you created. You can use the admin token or create one with the required scope.

6. Back in GitLab, paste the Events API URL in your Webhook URL. Use the query parameter `name` to match the name of the Data Source you created in Tinybird.

```
https://api.tinybird.co/v0/events?name=gitlab_work_item
```

1. Select **Add custom header** and add 'Authorization' as **Header name** and paste the token you created in Tinybird as **Header value**.

```
Bearer <TOKEN>
```

8. You're done. You can select **Test** to check if the webhook is working.

Check the status of the integration from the **Log** tab in the Tinybird `gitlab_work_item` Data Source. 

You can add more GitLab Webhooks to Tinybird by following the same steps. Find here some more [GitLab schemas](https://github.com/tinybirdco/tinynest/blob/main/tinybird/datasources/).
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [GitLab Webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html)
* [Tinybird Data Sources](https://github.com/tinybirdco/tinynest/blob/main/tinybird/datasources/)
