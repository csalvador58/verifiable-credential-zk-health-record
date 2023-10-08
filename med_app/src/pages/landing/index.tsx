import {
  Box,
  Button,
  Container,
  createStyles,
  CSSObject,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Footer } from '../../components/Footer';
import DoctorImage from '../../img/landingPage/doctor.jpg';
import EngineeringImage from '../../img/landingPage/engineering.jpg';
import LabImage from '../../img/landingPage/laboratory.jpg';
import WorkingEnvironmentImage from '../../img/landingPage/working-environment.jpg';
import { Header } from './Header';

const heroImageStyles: CSSObject = {
  position: 'absolute',
  borderRadius: '50%',
  objectFit: 'cover',
};

const useStyles = createStyles((theme) => ({
  outer: {
    overflow: 'hidden',
    backgroundImage: `radial-gradient(640px at top left, ${theme.fn.lighten(theme.fn.primaryColor(), 0.92)}, white)`,
  },

  inner: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '6rem',
    paddingBottom: '6rem',
    marginTop: '6rem',
    marginBottom: '6rem',

    [theme.fn.smallerThan('md')]: {
      flexDirection: 'column',
    },
  },

  content: {
    maxWidth: 480,
    marginRight: '4.5rem',
  },

  title: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: 56,
    lineHeight: 1.2,
    fontWeight: 600,

    [theme.fn.smallerThan('xs')]: {
      fontSize: 28,
    },
  },

  control: {
    [theme.fn.smallerThan('xs')]: {
      flex: 1,
    },
  },

  highlight: {
    color: theme.fn.primaryColor(),
  },

  heroImage1: {
    ...heroImageStyles,
    top: 192,
    right: 24,
    width: 384,
    height: 384,

    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  heroImage2: {
    ...heroImageStyles,
    top: 415,
    left: 435,
    width: 288,
    height: 288,
    marginTop: 25,

    [theme.fn.smallerThan('md')]: {
      position: 'static',
    },
  },

  heroImage3: {
    ...heroImageStyles,
    top: 0,
    right: -128,
    width: 448,
    height: 448,
  },

  heroImage4: {
    ...heroImageStyles,
    top: -48,
    left: -432,
    width: 864,
    height: 864,

    [theme.fn.smallerThan('md')]: {
      position: 'static',
      width: 288,
      height: 288,
    },
  },

  featureSection: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },

  featureBox: {
    backgroundColor: theme.fn.lighten(theme.fn.primaryColor(), 0.9),
    borderRadius: theme.radius.xl,
    padding: '2.25rem',
    width: 512,
  },

  featureTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: theme.spacing.md,
  },

  featureDescription: {
    fontSize: 18,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
  },
}));

const features = [
  {
    title: 'Created on the Medplum platform',
    description:
      `Open source project focused on FHIR standards while providing a secure and compliant data infrastructure layer. Organizations that support FHIR include EPIC Systems, SMART, CommonWell Health Alliance, and Apple's iPhone Health App.`,
  },
  {
    title: 'Generate VCs on demand',
    description:
      'Uses FHIR base standards to generate a Verifiable Credential of your personal health records.',
  },
  {
    title: 'Create Verifiable Presentations',
    description:
      'Easily select available VCs to generate a verifiable proof for verifiers.',
  },
  {
    title: 'Zero Knowledge',
    description:
      `Providing a new future focused on true privacy.`,
  },
];

export function LandingPage(): JSX.Element {
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();
  return (
    <div className={classes.outer}>
      <Header />
      <img className={classes.heroImage1} src='https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80' alt={`Holding patient's hand`} />
      <Container>
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Verifiable
              <br />
              <span className={classes.highlight}>Health Credentials</span>
            </Title>
            <Text size="lg" color="dimmed" mt="md">
              New focus on privacy. Create verifiable presentations of your health records and share only want you need to.
            </Text>
            <Group mt={30}>
              <Button radius="xl" size="md" className={classes.control}>
                Get started
              </Button>
              <Button variant="default" radius="xl" size="md" className={classes.control}>
                Need Help?
              </Button>
            </Group>
          </div>
          <img className={classes.heroImage2} src='https://images.unsplash.com/photo-1603899122361-e99b4f6fecf5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80' alt="Hand holding mobile phone with a green verify logo on screen" />
        </div>
      </Container>
      <Container>
        <div className={classes.inner}>
          <div style={{ width: 500 }}>
            <Text size={20} c={theme.primaryColor} mb="lg">
              Healthcare
            </Text>
            <Text size={36} weight={500} mb="md">
              The future of healthcare is now
            </Text>
            <Text size={20} c={theme.colors.gray[7]}>
              Built with Onyx by J.P. Morgan, Biconomy, and Magic on the Medplum platform. Your health is your data.
            </Text>
          </div>
          <img className={classes.heroImage3} src='https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2970&q=80' alt="Woman staring into sunlight in the woods" />
        </div>
      </Container>
      <Container>
        <div className={cx(classes.inner, classes.featureSection)}>
          <Stack align="flex-end">
            {features.map((feature, index) => (
              <Box key={`feature-${index}`} className={classes.featureBox}>
                <Text className={classes.featureTitle}>{feature.title}</Text>
                <Text className={classes.featureDescription}>{feature.description}</Text>
              </Box>
            ))}
          </Stack>
          <img className={classes.heroImage4} src='https://images.unsplash.com/photo-1642104704074-907c0698cbd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3132&q=80' alt="Ethereum blockchain logo" />
        </div>
      </Container>
      <Footer />
    </div>
  );
}
