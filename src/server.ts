import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  const image_url_regex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpeg|jpg|gif|png|svg)/

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req, res) => {
    let { image_url } = req.query;

    // return error when image url missing or format is not correct
    if (!image_url || !image_url.match(image_url_regex)) {
      return res.status(400).send("Image url is missing/incorrect, URL example: 'https://domain/paths/image_name.png/jpg/gif'")
    }

    try {
      let img_response = await filterImageFromURL(image_url)

      if(img_response){
        res.status(200).sendFile(img_response, async callback => {
          await deleteLocalFiles([img_response])
        })
      } else {
        throw "Failed to filter."
      }
    } catch (err) {
      res.status(422).send(`Failed to process image. Error: ${err}`)
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();