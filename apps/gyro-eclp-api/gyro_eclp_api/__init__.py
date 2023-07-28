import uvicorn
from concentrated_lps import geclp
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ParamsModel(BaseModel):
    alpha: str
    beta: str
    l: str
    c: str
    s: str


class DerivedParamsModel(BaseModel):
    tauAlphaX: str
    tauAlphaY: str
    tauBetaX: str
    tauBetaY: str
    u: str
    v: str
    w: str
    z: str
    dSq: str


@app.post("/calculate_derivative_parameters")
async def calculate_derivative_parameters(params: ParamsModel):
    derivativeParams = geclp.calc_derived_values(params)  # type: ignore
    return DerivedParamsModel(
        tauAlphaX=str(derivativeParams.tauAlpha[0]),
        tauAlphaY=str(derivativeParams.tauAlpha[1]),
        tauBetaX=str(derivativeParams.tauBeta[0]),
        tauBetaY=str(derivativeParams.tauBeta[1]),
        u=str(derivativeParams.u),
        v=str(derivativeParams.v),
        w=str(derivativeParams.w),
        z=str(derivativeParams.z),
        dSq=str(derivativeParams.dSq),
    )


if __name__ == "__main__":
    config = uvicorn.Config(
        "gyro_eclp_api:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True,
    )
    server = uvicorn.Server(config)
    server.run()
