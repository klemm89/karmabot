# Karmabot

This is a node / angular / firebase app that supports a bot which monitors upvotes & downvotes within a Hangouts group chat.


## How it works

-The robot has its own google account, which is added to the hangouts chat
-Using an android phone that is logged in with the robot account, a tasker profile is set up to scrape the notification tray for hangouts notifications.
-The tasker profile is set to strip out any newline characters and send the following POST request to the node server with the notification text.
-The node server parses the notification text and figures out what person to add / subtract karma from, and then updates Firebase with the proper values.
-The scoreboard for a chat room can be viewed by searching for the name of the chat room on the front end.
