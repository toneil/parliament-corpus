const metadata = require('./metadata');

metadata.getVideoMetadata('0166790812128').each(speech => console.log(speech));