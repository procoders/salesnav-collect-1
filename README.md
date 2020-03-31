
# Linkedin Cypress automation

[![](https://www.procoders.tech/art/pro-powered.png)](http://procoders.tech/)

Cypress automation for getting mutual connections with companies to leadgen them.

- [Installation](#installation)
- [Usage](#ready-to-go)
- [Authors](#authors)

**Warning**: LinkedIn has strong anti-scraping policies, they may blacklist ips making unauthenticated or unusual requests


## Installation

### Getting sources
0. First You have to check that [Node.js](https://nodejs.org/en/download) is installed
1. Run the terminal console and checkout the project by  `git clone https://github.com/procoders/salesnav-collect-1.git`
1. Go to project folder by `cd ~/salesnav-collect-1` 
2. Install all the packages by running `npm i` 

### Find out your LinkedIn token

Use [Chrome](https://www.google.com/intl/en/chrome/) browser for the following steps:

1. Navigate to [Linkedin.com](https://www.linkedin.com/feed/) and log in
2. Open up the browser developer tools (Ctrl-Shift-I or right click -> inspect element)
3. Select the Application tab
4. Under the Storage header on the left-hand menu, click the Cookies dropdown and select www.linkedin.com
5. Find the `li_at` cookie, and double click the value to select it before copying

Your token will look like *AQEDAQe65gUEbNDLAAABcN6bpJMAAAFxAmcok00AAsz3E4cwkpIwJcrtHt8HloLcGOdyhIcwPIvuoYDUQqSu3RhUrauqaT7GRfzn*. Keep somewhere for futher use

## Ready to go

### Build accounts lists

1. Put csv with companies list from Crunchbase *with LinkedIn column* to `fixtures/crunchbase-lists` folder
2. Run 

```
npm run build-list -- --env it_at=<your_linked_in_token>,listname=<your_file_name_without_csv_extension>
```

*For example*

npm run build-list -- --env it_at=AQEDAQe65gUEbNDLAAABcN6bpJMAAAFxAmcok00AAsz3E4cwkpIwJcrtHt8HloLcGOdyhIcwPIvuoYDUQqSu3RhUrauqaT7GRfzn,listname=demo-crunch

You will find you updated account list with companies at your SalesNav account

### Collect mutual for saved lists

Run 
```
npm run mutuals -- --env it_at=<your_linked_in_token>,listname=<your_file_name_without_csv_extension>,searchurl="<your_search_url_from_linkedin>"
```

You will be able to get your result csv as `fixtures/contacts/mutuals-<your_listname>.csv` file


*For example*


npm run mutuals-list -- --env  it_at="AQEDAQe65gUEbNDLAAABcN6bpJMAAAFxAmcok00AAsz3E4cwkpIwJcrtHt8HloLcGOdyhIcwPIvuoYDUQqSu3RhUrauqaT7GRfzn",listname="demo-crunch",searchurl=https://www.linkedin.com/sales/search/people?doFetchHeroCard=false&excludeContactedLeads=true&excludeSavedLeads=true


### Visual mode 

Since you wnat to see how script works in a realtime browser than use 
```
npm run cypress:open -- --env  .....
```

### How to drop list progress and start from scratch

In `cypress/state` subfolder you will see files according to your LinkedIn lists names. Since deliting it you purge the state and list collecting will be started from scratch


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Authors

[Procoders.TECH](https://procoders.tech)

We gear IT up!

> Procoders mission is to ship meaningful code, all our partners come from referrals, and our pricing model is transparent and fair. Drop us a line and let’s start a conversation right now. 

[![](https://www.procoders.tech/art/pro-powered.png)](http://procoders.tech/)
