// /*
//
//  */
//
// require("dotenv").config()
// require('dotenv').config({path:"../../.env"});
// require("dotenv").config({path:'../../../.env'})
// require("dotenv").config({path:'../../../../.env'})
// const TAG  = " | coins | "
//
// describe(' - unit test '+TAG+' - ', function() {
//     let tag = TAG + " | test_service | "
//     try {
//         const log = console.log;
//
//         beforeEach(() => {
//             console.log = jest.fn(); // create a new mock function for each test
//             jest.setTimeout(90000)
//         });
//         afterAll(() => {
//             console.log = log; // restore original console.log after all tests
//         });
//
//         it('Loads Abuse Seed', async function() {
//             //start app and get wallet
//             wallet = await startApp()
//             //log(tag,"wallet: ",wallet)
//             username = wallet.username
//             expect(username).toBeDefined();
//         });
//
//
//     } catch (e) {
//         log.error(e)
//         //process
//         process.exit(666)
//     }
// })
