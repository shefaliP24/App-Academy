const http = require('http');

const dogs = [
  {
    dogId: 1,
    name: "Fluffy",
    age: 2
  }

];

let nextDogId = 2;

function getNewDogId() {
  const newDogId = nextDogId;
  nextDogId++;
  return newDogId;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // request is finished assembly the entire request body
    // Parsing the body of the request depending on the Content-Type header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ======================== ROUTE HANDLERS ======================== */

    // GET /dogs
    if (req.method === 'GET' && req.url === '/dogs') {
      res.setHeader("Content-Type",'application/json')
      res.write(JSON.stringify(dogs))
      return res.end();
    }

    // GET /dogs/:dogId
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/'); // ['', 'dogs', '1']
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        const dog=dogs.find((dog)=>dog.dogId==dogId)
        res.setHeader("Content-Type",'application/json')
      res.write(JSON.stringify(dog))
      
      return res.end();
    }}

    // POST /dogs
    if (req.method === 'POST' && req.url === '/dogs') {
      const { name, age } = req.body;
      // Your code here
      
      const newdog={
        dogId:getNewDogId(),
        name:name,
        age:age
        
      }
      dogs.push(newdog)
      res.setHeader("Content-Type",'application/json')
      res.statusCode=201
      res.write(JSON.stringify(newdog))
      return res.end();
    }

    // PUT or PATCH /dogs/:dogId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        const dog=dogs.filter((dog)=>dog.dogId==dogId)[0]
        console.log(dog)
        res.setHeader("Content-Type",'application/json')
        res.statusCode=200
        dog['name']=req.body.name 
        dog['age']=req.body.age
        console.log("u",dog)
        
      res.write(JSON.stringify(dog))

      return res.end();
    }}

    // DELETE /dogs/:dogId
    if (req.method === 'DELETE' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        const index=dogs.findIndex((dog)=>dog.dogId==dogId)
        console.log(dogs)
        dogs.splice(index)
        res.setHeader("Content-Type",'application/json')
        console.log(dogs)
      }
      return res.end(JSON.stringify({message:"Successfully deleted"}));
    }

    // No matching endpoint
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end('Endpoint not found');
  });

});


if (require.main === module) {
    const port = 8000;
    server.listen(port, () => console.log('Server is listening on port', port));
} else {
    module.exports = server;
}