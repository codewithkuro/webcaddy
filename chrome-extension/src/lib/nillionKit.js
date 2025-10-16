import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

// Import Nillion SDK components
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

// Configuration
const config = {
    NILCHAIN_URL: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
    NILAUTH_URL: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
    NILDB_NODES: 'https://nildb-stg-n1.nillion.network,https://nildb-stg-n2.nillion.network,https://nildb-stg-n3.nillion.network'.split(','),
    BUILDER_PRIVATE_KEY: '',
};

function createKeyPairs(privateKey) {
    const builderKeypair = Keypair.from(privateKey); // Use your funded key
    const userKeypair = Keypair.generate(); // Generate random user

    const builderDid = builderKeypair.toDid().toString();
    const userDid = userKeypair.toDid().toString();

    console.log('Builder DID:', builderDid);
    console.log('User DID:', userDid);

    return { builderKeypair, userKeypair, builderDid, userDid };
}

function printOutput() {
    console.log('printOut from nillionKit');
}