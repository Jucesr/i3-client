import React from 'react'
// import './Viewer.scss'

class Viewer extends React.Component {

  constructor () {

    super()

    // this.loadDynamicExtension = this.loadDynamicExtension.bind(this)

    this.viewer

    this.viewerApp

    this.height = 0

    this.width = 0
  }


  ///////////////////////////////////////////////////////////////////
  // Component has been mounted so this container div is now created
  // in the DOM and viewer can be instantiated
  //
  ///////////////////////////////////////////////////////////////////
  componentDidMount = () => {
    const {encode} = this
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: function(onGetAccessToken) {
          //
          // TODO: Replace static access token string below with call to fetch new token from your backend
          // Both values are provided by Forge's Authentication (OAuth) API.
          //
          // Example Forge's Authentication (OAuth) API return value:
          // {
          //    "access_token": "<YOUR_APPLICATION_TOKEN>",
          //    "token_type": "Bearer",
          //    "expires_in": 86400
          // }
          //
          
          // fetch('https://developer.api.autodesk.com/authentication/v1/authenticate',{
          //   method: 'POST',
          //   mode: "no-cors",
          //   headers: {
          //     "Content-Type": "application/x-www-form-urlencoded",
          //   },
          //   body: encode({
          //     client_id: '7DjD2TfDVetfoDP6cv8IHezcFIwxDsWJ',
          //     client_secret: 'qV8yymbsmGGnP72a',
          //     grant_type: 'client_credentials',
          //     scope: 'viewables:read'
          //   })
          // })
          // .then(response => {
          //   debugger;
          //   return response.json()
          // })
          // .then(body => {
          //   var accessToken = body.access_token;
          //   var expireTimeSeconds = body.expires_in;
          //   onGetAccessToken("eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiI3RGpEMlRmRFZldGZvRFA2Y3Y4SUhlemNGSXd4RHNXSiIsImV4cCI6MTU0MTg4MTQwNiwic2NvcGUiOlsiYnVja2V0OnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiZGF0YTp3cml0ZSIsImRhdGE6cmVhZCJdLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvand0ZXhwNjAiLCJqdGkiOiJYRFVoMjE5ZjNiTWE3OU00Z09SMFkzWnRIRjFBbDdVTThGeVpYVjNKaGxXVlVrY3BadXk5REZKTlNXbFNvRVdWIn0.2C-hROTxMkd1Ble2tkID1vUs-jd-U68gtCyGqgrwvXc", 3599);
          // })

          onGetAccessToken("eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiI3RGpEMlRmRFZldGZvRFA2Y3Y4SUhlemNGSXd4RHNXSiIsImV4cCI6MTU0MTg4NTM4OCwic2NvcGUiOlsidmlld2FibGVzOnJlYWQiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoiclkybWFKWTVhR0I5T2ZGbWc4cG9BcU51Z2lqWGI4VDRJUkVSY0xPdUl5elA2dFU3bW1EcmpZUjBWVGk5Z1FzbiJ9.a3x_GKeSf2elVdO2r5UxoOvQpjAmLXpf5SVNbBRLl2A", 3599);
          

          
    }

    };
    var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aTMtbW9kZWxzL2FyY2EucnZ0';

    Autodesk.Viewing.Initializer(options, () => {
      this.viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
      this.viewerApp.registerViewer(this.viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
      this.viewerApp.loadDocument(documentId, this.onDocumentLoadSuccess, this.onDocumentLoadFailure);
    });
  }

  encode = (srcjson) => {
    if(typeof srcjson !== "object") if(typeof console !== "undefined"){ console.log("\"srcjson\" is not a JSON object"); return null; }
    var u = encodeURIComponent;
    var urljson = "";
    var keys = Object.keys(srcjson);
    for(var i=0; i <keys.length; i++){
      urljson += u(keys[i]) + "=" + u(srcjson[keys[i]]);
      if(i < (keys.length-1))urljson+="&";
    }
    return urljson;
  }

  onDocumentLoadFailure = (viewerErrorCode) =>{
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }

  onDocumentLoadSuccess = (doc) => {

    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = this.viewerApp.bubble.search({'type':'geometry'});
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    // Choose any of the avialble viewables
    this.viewerApp.selectItem(viewables[0].data, this.onItemLoadSuccess, this.onItemLoadFail);
  }

  onItemLoadSuccess = (viewer, item) => {
    this.viewer = this.viewerApp.getCurrentViewer()
    console.log('onItemLoadSuccess()!');
    console.log(viewer);
    console.log(item);

    // Congratulations! The viewer is now ready to be used.
    console.log('Viewers are equal: ' + (viewer === this.viewer));
  }

  onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  componentDidUpdate = () => {

    if (this.viewer && this.viewer.impl) {

      if (this.viewerContainer.offsetHeight !== this.height || this.viewerContainer.offsetWidth !== this.width) {

        this.height = this.viewerContainer.offsetHeight
        this.width = this.viewerContainer.offsetWidth

        this.viewer.resize()
      }
    }
  }

  getViewer = () => {
    return this.viewer
  }

  ///////////////////////////////////////////////////////////////////
  // Component will unmount so we can destroy the viewer to avoid
  // memory leaks
  //
  ///////////////////////////////////////////////////////////////////
  componentWillUnmount = () => {

    if (this.viewer) {

      if(this.viewer.impl.selector) {

        this.viewer.tearDown()
        this.viewer.finish()
        this.viewer = null
      }
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Render component, resize the viewer if exists
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="Viewer-container">
        <div 
          className="Viewer"
          id="MyViewerDiv" 
          ref={ (div) => this.viewerContainer = div }
        >
          
        </div> 
      </div>
      
    )
  }
}

export default Viewer
