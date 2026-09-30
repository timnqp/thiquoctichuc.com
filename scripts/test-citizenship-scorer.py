#!/usr/bin/env python3
"""Smoke-check citizenship pass rules: 5/5 values AND 15/20 overall."""


def evaluate(questions, answers):
    values = [q for q in questions if q["topic"] == "values"]
    values_correct = sum(1 for q in values if answers.get(q["id"]) == q["correct"])
    overall = sum(1 for q in questions if answers.get(q["id"]) == q["correct"])
    total = len(questions)
    values_passed = len(values) > 0 and values_correct == len(values)
    overall_passed = overall >= int((total * 0.75 + 0.999))  # ceil
    import math

    overall_passed = overall >= math.ceil(total * 0.75)
    return values_passed and overall_passed, values_correct, overall


def make_paper():
    qs = []
    for i in range(15):
        qs.append({"id": f"g{i}", "topic": "general", "correct": "a"})
    for i in range(5):
        qs.append({"id": f"v{i}", "topic": "values", "correct": "a"})
    return qs


def main():
    qs = make_paper()
    all_right = {q["id"]: "a" for q in qs}
    miss_one_value = dict(all_right)
    miss_one_value["v0"] = "b"
    # 16/20 with 4/5 values: miss 3 general + 1 values
    answers_16_4 = dict(all_right)
    for i in range(3):
        answers_16_4[f"g{i}"] = "b"
    answers_16_4["v0"] = "b"
    # 15/20 with 5/5 values: miss 5 general
    answers_15_5 = dict(all_right)
    for i in range(5):
        answers_15_5[f"g{i}"] = "b"

    p, v, o = evaluate(qs, answers_16_4)
    assert (v, o) == (4, 16), (v, o)
    assert p is False, "16/20 with 4/5 values must FAIL"

    p, v, o = evaluate(qs, answers_15_5)
    assert (v, o) == (5, 15), (v, o)
    assert p is True, "15/20 with 5/5 values must PASS"

    print("scorer rules ok")


if __name__ == "__main__":
    main()
