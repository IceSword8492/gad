import axios from 'axios'

(async _ => console.log((await axios.get('https://www.google.com/')).data))();
