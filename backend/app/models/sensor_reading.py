from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.db.base import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hum_p1: Mapped[int] = mapped_column(Integer, nullable=False)
    hum_p2: Mapped[int] = mapped_column(Integer, nullable=False)
    temp_dht11: Mapped[float] = mapped_column(Float, nullable=False)
    hum_dht11: Mapped[float] = mapped_column(Float, nullable=False)
    luz: Mapped[int] = mapped_column(Integer, nullable=False)
    estado_luz: Mapped[str] = mapped_column(String(24), nullable=False)
    agua: Mapped[int] = mapped_column(Integer, nullable=False)
    planta1_seca: Mapped[bool] = mapped_column(Boolean, nullable=False)
    planta2_seca: Mapped[bool] = mapped_column(Boolean, nullable=False)
    tanque_bajo: Mapped[bool] = mapped_column(Boolean, nullable=False)
    bomba_p1: Mapped[bool] = mapped_column(Boolean, nullable=False)
    bomba_p2: Mapped[bool] = mapped_column(Boolean, nullable=False)
    regando: Mapped[bool] = mapped_column(Boolean, nullable=False)
    planta_regando: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    dht_ok: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    modo: Mapped[str] = mapped_column(String(16), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
