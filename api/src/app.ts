import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

loadEnv();

import {
    Keypair,
    NilauthClient,
    PayerBuilder,
    NucTokenBuilder,
    Command,
  } from '@nillion/nuc';
  import {
    SecretVaultBuilderClient,
    SecretVaultUserClient,
  } from '@nillion/secretvaults';

  const config = {
    NILCHAIN_URL: process.env.NILCHAIN_URL,
    NILAUTH_URL: process.env.NILAUTH_URL,
    NILDB_NODES: process.env.NILDB_NODES.split(','),
    BUILDER_PRIVATE_KEY: process.env.BUILDER_PRIVATE_KEY,
  };
  
  if (!config.BUILDER_PRIVATE_KEY) {
    console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
    process.exit(1);
  }

interface User {
    id: number,
    name: string
}

interface ContactInfo {
  id: string,
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  address: string,
  region: string,
  country: string  
}

const app = express();

const userDids = new Map();

app.use(express.json());

let users: User[] = [];

app.get('/users', (req: Request, res: Response) => {
    res.json(users);
})

app.post('/users', (req: Request, res: Response) => {
    const user: User = req.body;
    users.push(user);
    res.status(201).json(user);
})

app.post('/userdid', async (req: Request, res: Response) => {
  let currentUserKeypair = Keypair.generate();
  const userKPString = currentUserKeypair.toDid().toString();
  userDids.set(userKPString, {
    did: userKPString
  });
  res.status(201).send(userKPString);
});

app.get('/userdid', async (req: Request, res: Response) => {
  res.status(200).json(Array.from(userDids.keys()));
});

app.post('/contactinfo', async (req: Request, res: Response) => {
    const contactinfo: ContactInfo = req.body;

    let contactInfo = {
      _id: randomUUID(),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: { '%allot': req.body.email },
      phone: { '%allot': req.body.phone },
      address: { '%allot': req.body.address},
      region: { '%allot': req.body.region },
      country: {'%allot': req.body.country }
    };
    
    try {
    const uploadResults = await userClient.createData(delegation, {
      owner: userDid,
      acl: {
        grantee: builderDid,
        read: true,
        write: false,
        execute: true
      },
      collection: contactInfoCollectionId,
      data: [contactInfo]
    })  
    res.status(201).json(uploadResult);
  } catch(err) {
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;

let builderKeypair, userKeypair, builderDid, userDid;
let payer, nilauth;
let builder, existingProfile;
let collectionId, collection;
let contactInfoCollectionId;
let userClient, delegation;

main().then(() => {
  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  });
}).catch(error => console.log('Error starting services .. \n', error));


async function createKeypairs() {
    // Step 1: Create keypairs for builder and user
    builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY); // Use your funded key
    userKeypair = Keypair.generate(); // Generate random user

    builderDid = builderKeypair.toDid().toString();
    userDid = userKeypair.toDid().toString();

    console.log('Builder DID:', builderDid);
    console.log('User DID:', userDid);
}


async function createPayerAndNilauthClient() {
  payer = await new PayerBuilder()
  .keypair(builderKeypair)
  .chainUrl(config.NILCHAIN_URL)
  .build();

  nilauth = await NilauthClient.from(config.NILAUTH_URL, payer);
}

async function initBuilder() {
    builder = await SecretVaultBuilderClient.from({
    keypair: builderKeypair,
    urls: {
      chain: config.NILCHAIN_URL,
      auth: config.NILAUTH_URL,
      dbs: config.NILDB_NODES,
    },
  });
  
  // Refresh token using existing subscription
  await builder.refreshRootToken();  
}

async function initProfile() {
  try {
    existingProfile = await builder.readProfile();
    console.log('✅ Builder already registered:', existingProfile.data.name);
  } catch (profileError) {
    try {
      await builder.register({
        did: builderDid,
        name: 'My Demo Builder',
      });
      console.log('✅ Builder registered successfully');
    } catch (registerError) {
      // Handle duplicate key errors gracefully
      if (registerError.message.includes('duplicate key')) {
        console.log('✅ Builder already registered (duplicate key)');
      } else {
        throw registerError;
      }
    }
  }
}

async function main() {
  await createKeypairs();
  await createPayerAndNilauthClient();
  await initBuilder();
  await initProfile();
  // await setupCollection();
  await setupContactInfoCollection();

  userClient = await createUserClient();
  delegation = await createDelegation();
}

async function createDelegation() {
  const delegation = NucTokenBuilder.extending(builder.rootToken)
  .command(new Command(['nil', 'db', 'data', 'create']))
  .audience(userKeypair.toDid())
  .expiresAt(Math.floor(Date.now() / 1000) + 3600) // 1 hour
  .build(builderKeypair.privateKey());

  return delegation;
}

async function setupContactInfoCollection() {
  contactInfoCollectionId = randomUUID();

  let contactInfoCollection = {
    _id: contactInfoCollectionId,
    type: 'owned',
    name: 'User Contact Info Collection', 
    schema:  {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      uniqueItems: true,
      items: {
      type: 'object',
      properties: {
          _id: { type: 'string', format: 'uuid' },
          firstname: { type: 'string' }, // name will not be secret shared
          lastname: { type: 'string' },
          email: { // email will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
          phone: { // phone will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
          address: { // address will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
          region: { // region will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
          country: { // country will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
      },
      required: ['_id', 'firstname', 'email', 'address'],
      },
    }
  }

  try {
    const createResults = await builder.createCollection(contactInfoCollection);
    console.log(
      '✅ Owned collection contactInfoCollection created on',
      Object.keys(createResults).length,
      'nodes'
    );
  } catch (error) {
    console.error('❌ Collection creation failed:', error);
    // Handle testnet infrastructure issues gracefully
  }
}

async function setupCollection() {
  collectionId = randomUUID();

  collection = {
  _id: collectionId,
  type: 'owned', // Every document in the collection will be user-owned
  name: 'User Profile Collection',
  schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      uniqueItems: true,
      items: {
      type: 'object',
      properties: {
          _id: { type: 'string', format: 'uuid' },
          name: { type: 'string' }, // name will not be secret shared
          email: { // email will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
          phone: { // phone will be secret shared
            type: "object",
            properties: {
              "%share": {
                type: "string"
              }
            },
            required: [
              "%share"
            ]
          },
      },
      required: ['_id', 'name', 'email'],
      },
    },
  };

  try {
    const createResults = await builder.createCollection(collection);
    console.log(
      '✅ Owned collection contactInfoCollection created on',
      Object.keys(createResults).length,
      'nodes'
    );
  } catch (error) {
    console.error('❌ Collection creation failed:', error.message);
    // Handle testnet infrastructure issues gracefully
  }

}

async function createUserClient() {  
  const user = await SecretVaultUserClient.from({
    baseUrls: config.NILDB_NODES,
    keypair: userKeypair,
    blindfold: {
      operation: 'store',
    },
  });

  return user;
}
