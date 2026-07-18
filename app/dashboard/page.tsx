import { auth } from '@clerk/nextjs';
import Dropzone from '@/components/Dropzone';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { FileType } from '@/typings';
import TableWrapper from '@/components/table/TableWrapper';
import StorageChart from '@/components/StorageChart';
import { redirect } from 'next/navigation';


async function dashboard() {
  const { userId } = auth();
  const docsResults = await getDocs(collection(db, "users", userId!, "files"));
  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().fileName || doc.id,
    timestamp: new Date(doc.data().timeStamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));
  //console.log(skeletonFiles);

  const userDocRef = doc(db, "users", userId!);
  let userDocSnap;
  let storageLimit;

  try {
    userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || !userDocSnap.data().storageLimit) {
      redirect("/onboarding");
    }
    storageLimit = userDocSnap.data().storageLimit;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // If it's a redirect error, re-throw it
    // @ts-ignore
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // For other errors (permissions, network), redirect to safely handle
    redirect("/onboarding");
  }
  const usedBytes = skeletonFiles.reduce((acc, file) => acc + file.size, 0);
  return (
    <div className="border-t">
      <Dropzone />
      <section className="container space-y-5">
        <h2 className="font-bold">All Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <TableWrapper skeletonFiles={skeletonFiles} />
          </div>
          <div>
            <StorageChart usedBytes={usedBytes} limitBytes={storageLimit} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default dashboard