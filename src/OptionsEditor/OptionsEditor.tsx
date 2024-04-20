import { useEffect, useState } from 'react'
import { FC } from 'react'

import styles from './OptionsEditor.module.css'

interface IParam {
  id: string
  name: string
  type: string
}
interface ParamValue {
  id: number
  paramId: number
  value: string
}
interface IModel {
  paramValues: ParamValue[]
  colors: string
}
interface Props {
  params: IParam[]
  model: IModel
}

type ModelProps = {
  model: ParamValue
  refreshToggle: boolean
  setRefreshToggle: (value: boolean) => void
}

const Model = ({ model, refreshToggle, setRefreshToggle }: ModelProps) => {
  const [newValue, setNewValue] = useState<string>(model.value)

  const updateModel = async () => {
    await fetch(`http://localhost:3004/model/${model.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        ...model,
        value: newValue,
      }),
    })
  }

  const deletModel = async () => {
    await fetch(`http://localhost:3004/model/${model.id}`, {
      method: 'DELETE',
    })
  }

  return (
    <div>
      <input
        className={styles.correction_input}
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
      />
      <button
        className={styles.button_correction}
        onClick={async () => {
          if (!newValue) return
          await updateModel()
          setRefreshToggle(!refreshToggle)
        }}
      >
        Правка
      </button>
      <button
        className={styles.button_delete}
        onClick={async () => {
          await deletModel()
          setRefreshToggle(!refreshToggle)
        }}
      >
        Удалить
      </button>
    </div>
  )
}

type ParamProps = {
  param: IParam
}

const Param = ({ param }: ParamProps) => {
  const [newValue, setNewValue] = useState<string>()
  const [refreshToggle, setRefreshToggle] = useState<boolean>(false)
  const [models, setModels] = useState<ParamValue[]>([])

  useEffect(() => {
    fetch(`http://localhost:3004/model/?paramId=${param.id}`)
      .then((res) => res.json())
      .then((data) => setModels(data))
  }, [refreshToggle, param.id])

  const createModel = async (newValue: string, paramId: string) => {
    await fetch('http://localhost:3004/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        value: newValue,
        paramId,
      }),
    })
  }

  return (
    <div className={styles.content}>
      <div className={styles.param}>{param.name}</div>
      <div className={styles.ParamValues}>
        <div className={styles.inputContainer}>
          <input
            className={styles.param_input}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            className={styles.button_param}
            onClick={async () => {
              if (!newValue) return
              await createModel(newValue, param.id)
              setRefreshToggle(!refreshToggle)
              setNewValue('')
            }}
          >
            Добавить новые значения
          </button>
        </div>
        {models.map((model) => {
          return (
            <Model
              model={model}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
            />
          )
        })}
      </div>
    </div>
  )
}

const OptionsEditor: FC = () => {
  const [newParam, setNewParam] = useState<string>()
  const [refreshToggle, setRefreshToggle] = useState<boolean>(false)
  const [params, setParams] = useState<IParam[]>([])

  useEffect(() => {
    fetch('http://localhost:3004/params')
      .then((res) => res.json())
      .then((data) => setParams(data))
  }, [refreshToggle])

  const createParam = async (newParam: string) => {
    await fetch('http://localhost:3004/params', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        name: newParam,
        type: 'string',
      }),
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          value={newParam}
          onChange={(e) => setNewParam(e.target.value)}
        />
        <button
          className={styles.button_param}
          onClick={async () => {
            if (!newParam) return
            await createParam(newParam)
            setRefreshToggle(!refreshToggle)
            setNewParam('')
          }}
        >
          Добавить новый параметр
        </button>
      </div>
      {params.map((param) => {
        return <Param param={param} />
      })}
    </div>
  )
}

export default OptionsEditor
