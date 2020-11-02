const { Worker }  = require('worker_threads');;

let workDir = __dirname+"/dbWorker.js";

const axios = require('axios');
const cheerio = require('cheerio');

const mainFunc = async () => {
    const url = "https://www.iban.com/exchange-rates";

    // fetch html data from iban website
    let res = await fetchData(url);
    if(!res.data){
        console.log("Invalid data Obj");
        return;
    }
    const html = res.data;
    let dataObj = new Object();

    // mount html page to the root element
    const root = cheerio.load(html);
    
    // select table classes, all table rows inside table body
    const statsTable = root('.table.table-bordered.table-hover.downloads > tbody > tr');

    //loop through all table rows and get table data
    statsTable.each(function() {
        let title = root(this).find('td').text(); // get the text in all the td elements
        let newStr = title.split("\t"); // convert text (string) into an array
        newStr.shift(); // strip off empty array element at index 0
        formatStr(newStr, dataObj); // format array string and store in an object
    });

    return dataObj;

}

const scrapWorcester = async () => {
    const baseUrl = "http://www.worcesterma.gov"
    const url = `${baseUrl}/departments`;
    const res = await fetchData(url);
    if (!res.data) {
        console.log("failed to fetch ", url);
        return;
    }
    const html = res.data;
    const rootObject = new Object();

    // mount root html page
    const rootHTML = cheerio.load(html);
    // select bootstrap deptcolumns 
    // .col-md-4 > ul > li > a
    // attribs ==> { title: "", href: ""}
    const departmentcColumns = rootHTML('.col-md-4 > ul > li > a')
    const departmentList = [];
    // build list of depts and urls
    departmentcColumns.each((index, currentElement)=> {
        const data = currentElement.attribs;
        const currentDeparmentAndLink = {
            deptName : data.title,
            url: `${baseUrl}${data.href}`
        }
        departmentList.push(currentDeparmentAndLink)
    })
    departmentList.forEach(async currDept => {
        const deptPage = await fetchData(currDept.url);

        const deptHtml = deptPage.data;
        const deptRoot = cheerio.load(deptHtml);
        const contactData = deptRoot('.well.well-sm.box-shadow--2dp > p');
        let addressHolder = `${currDept.deptName} --`;
        const addressParentNode = contactData[0];
        addressParentNode.childNodes.forEach(currentChildNode => {
            if (currentChildNode.data) {
                addressHolder += currentChildNode.data;
                addressHolder += "--";
            }
        })
        console.log(addressHolder)
    })

    /**
     * deptRoot('.well.well-sm.box-shadow--2dp > p')
     * Node O
         * Node 0 - firstChild.data || nodeValue => department
         * Node 1 - .data => street number and  address 
         * Node 2 - br
         * Node 3 - .data city, state, zipcode
        Node 1
            Node 0 - .data phone number`
     */


}
/*
mainFunc().then((res) => {
    // start worker
    const worker = new Worker(workDir); 
    console.log("Sending crawled data to dbWorker...");
    // send formatted data to worker thread 
    worker.postMessage(res);

    // listen to message from worker thread
    worker.on("message", (message) => {
        console.log(message)
    });
}); 
*/

scrapWorcester()


async function fetchData(url){
    console.log("Crawling data...", url )

    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));
    
    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    return response;

}

function formatStr(arr, dataObj){
    let regExp = /[^A-Z]*(^\D+)/ // regex to match all the words before the first digit
    let newArr = arr[0].split(regExp); // split array element 0 using the regExp rule
    dataObj[newArr[1]] = newArr[2]; // store object 
}

