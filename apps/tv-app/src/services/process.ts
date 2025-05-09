import * as ps from 'ps-node';

export async function findProcess(processName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ps.lookup({ command: processName }, (err: any, resultList: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (resultList.length === 0) {
        resolve(null);
        return;
      }
      
      resolve(resultList[0]);
    });
  });
} 