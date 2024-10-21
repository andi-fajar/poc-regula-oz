import { Button, Container, Header, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleRegulaDocumentReader = () => {
    navigate('/regula-doc');
  }

  const handleRegulaLiveness = () => {
    navigate("/regula-liveness");
  }

  const handleOz = () => {
    navigate("/oz-liveness");
  }

  const handleRegulaDocsLiveness = () => {
    navigate("/regula-doc-liveness");
  }

  const handleAaiLivenes = () => {
    navigate("/aai-liveness");
  }

  const handleAaiOcr = () => {
    navigate("/aai-ocr");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Segment inverted color="blue" textAlign="center" padded="very">
        <Header as="h1" content="POC OZ/Regula" />
      </Segment>

      <Container style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleRegulaDocumentReader()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Document Reader
          </Button>
          <Button
            fluid
            size="large"
            color="blue"
            onClick={() => handleRegulaLiveness()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Liveness
          </Button>
          <Button
            fluid
            size="large"
            color="blue"
            onClick={() => handleOz()}
            style={{ marginBottom: '1rem' }}
          >
            OZ Liveness
          </Button>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleAaiOcr()}
            style={{ marginBottom: '1rem' }}
          >
            Advance AI OCR
          </Button>
          <Button
            fluid
            size="large"
            color="blue"
            onClick={() => handleAaiLivenes()}
            style={{ marginBottom: '1rem' }}
          >
            Advance AI Liveness
          </Button>
          <Header as={"h5"} style={{ textAlign: 'center' }}>ID Check + Potrait Comparison:</Header>
          <Button
            fluid
            size="large"
            color="teal"
            onClick={() => handleRegulaDocsLiveness()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Docs + Regula Liveness
          </Button>
        </div>
      </Container>

      <Segment inverted textAlign="center" padded="very">
        <p>&copy; 2024 CSF</p>
      </Segment>
    </div>
  );
}

export default Home;
