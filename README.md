## Step 02 - Provisioning CloudFront and S3 with the runtime code

1. Install aws-cdk cli version 2 and typescript globally
``` sh
sudo npm install -g typescript@4.9.3 aws-cdk@2.53.0
```

2. inside the `fuelpass` directory create a new directory called `cdk`. Change directory to the `cdk` and create a new cdk typescript project with the following command
``` sh
cdk init app --language typescript
```

3. Update the `cdk/lib/cdk-stack.ts` with the following code snippet
```typescript
import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // S3 bucket that serves the frontend website
     const bucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    // S3 deployment
    new BucketDeployment(this, 'BucketDeployment', {
      sources: [Source.asset('../build')],
      destinationBucket: bucket,
    });

    // Create cloudfront distribution
    const distribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: { origin: new S3Origin(bucket) },
    });

     // Outputs
     new CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName
    })

     new CfnOutput(this, 'CloudFrontId', {
      value: distribution.distributionId
    })
  }
}
```

4. Go back to the `fulepass` folder and run `npm run build` to build the frontend react project. You should see the `build` folder is getting created.

5. Go back to the `cdk` folder and run `cdk ls` command to check if there are any errors.

6. Run `cdk bootstrap` boostrap the cdk project with your AWS account and then `cdk deploy` to deploy the infrasturcture with the runtime code. 
   
7. Copy the CloudFront domain name and view it in the browser. 

<img width="785" alt="image" src="https://user-images.githubusercontent.com/2338919/205990141-bd8c0ae2-ad4b-4ad6-b661-4633408e484b.png">

8. Goto the `fuelpass` root folder and open `package.json` file. Update the script section as follows. Replace your distribution id withe the distribution_id placeholder.
```json
{
    ...
    "scripts": {
        "deploy": "react-scripts build && cd cdk && tsc && cdk deploy",
        "postdeploy": "aws cloudfront create-invalidation --distribution-id <distribution_id> --paths '/*'",
        ...
  }
  ...
```

9. Do some changes to the frontend code and execute `npm run deploy` inside the `fuelpass` folder. The frontend changes should reflect after the deployment



