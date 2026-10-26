"""Regenerate measured public notebook examples from the current implementation."""
import base64
import io
import json
from pathlib import Path
import shutil
import sys

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/"python_service"))
from fastapi import UploadFile
from service import process_image


def main():
    output=ROOT/"client/public/research"
    output.mkdir(exist_ok=True)
    samples=[]
    for path in sorted((ROOT/"client/public/mri").glob("*.jpg")):
        sequence="T1C+" if "T1C" in path.name else "T1" if "T1" in path.name else "T2"
        result=process_image(UploadFile(filename=path.name,file=io.BytesIO(path.read_bytes())),sequence,1.,99.,.5,50.,2,3,3,7,"notebook-v1",False,True)
        result.update(sessionId="demo-"+path.stem,demo=True,notes="",source={"type":"precomputed notebook demonstration","split":"demonstration"})
        folder=output/path.stem
        folder.mkdir(exist_ok=True)
        for key, value in result["step_images"].items():
            (folder/f"{key}.png").write_bytes(base64.b64decode(value.split(",",1)[1]))
            result["step_images"][key]=f"/research/{path.stem}/{key}.png"
        (output/f"{path.stem}.json").write_text(json.dumps(result),encoding="utf-8")
        samples.append({"id":path.stem,"filename":path.name,"sequence":sequence,"path":f"/mri/{path.name}",
                        "dimensions":result["dimensions"],"metrics":result["metrics"],"warnings":result["warnings"],"result_url":f"/research/{path.stem}.json"})
        print(f"Generated {path.stem}",flush=True)
    (output/"samples.json").write_text(json.dumps(samples),encoding="utf-8")
    artifact=ROOT/"python_service/artifacts/evaluation.json"
    if artifact.exists():
        shutil.copyfile(artifact,output/"evaluation.json")


if __name__=="__main__":
    main()
