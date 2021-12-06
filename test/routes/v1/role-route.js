let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../../../src");
let should = chai.should();

chai.use(chaiHttp);

describe("testing roles api...", () => {
  beforeEach((done) => done());

  describe("/GET roles", () => {
    it("it should GET all the roles", (done) => {
      chai
        .request(server)
        .get("/api/fusion-configuration-service/roles")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.payload.should.be.a("array");
          done();
        });
    });
  });
});
