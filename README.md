# STUVAT

## Description

Stuvat is an application that allows for sending bounding box information on a static image. It is also a play on words of popular application, Cvat, that does something similar.

## Quick (local) start

Create a .env file inside the ./app directory. Add two variables called:

```
REACT_APP_WEB_ENDPOINT=*The endpoint to send bounding boxes to*
REACT_APP_PASSWORD=*The password to get into your application*
```

To start up locally use the following:

```
git clone git@github.com:stuartallen/Stuvat.git
cd website
pnpm i
pnpm start
```

## Tech stack

React - Frontend/SPA framework
Tailwind - Easy style framework, no confusing classnames
Axios - Making requests easy to send

## Apple Demo Picture Courtesy of Pexels

link: https://www.pexels.com/search/apples/
